# Virtual Tag (Vtag) Requirements & Logic Definition

## 1. Overview
The Virtual Tag (Vtag) module allows administrators to define custom calculated tags based on existing Physical Tags (Ptags) and other Vtags. The frontend acts exclusively as a configuration metadata designer. All mathematical computation, data processing, and output generation are delegated to the Azure Synapse analytics backend (pipeline and dataflow).

## 2. Core Identity & Versioning
* **Vtag Identity**: Each Vtag requires a unique Identifier, Name, and an optional Description.
* **Effective Period**: A Vtag is active only during a strict bounding date range (`Start Date` to `End Date`). 
  * *Constraint*: The system enforces a strict non-overlapping validation rule. A single Vtag cannot have overlapping effective periods in its history. If an overlap is detected during configuration, the UI will raise an alarm and block confirmation/saving.
* **History Library**: A repository of past configurations for each Vtag allows users to review, load, and trace the history of the Vtag logic over time.

## 3. Data Source & Preprocessing
Vtags support two foundational Data Types:
* **Actual**: Represents a direct reading or live value. No initial transformation is applied before the calculation.
* **Accumulated (Acc)**: Represents rolling or accumulated consumption values (e.g., a standard utility meter). 
  * Requires a **Collection Frequency** (`Hourly`, `Daily`, `Monthly`, `Yearly`).
  * *Logic*: Synapse will compute the delta between consecutive timestamps based on this frequency (e.g., finding the difference between `00:00` yesterday and `00:00` today).
  * *Handling Anomalies*: If the logic cannot locate a required boundary timestamp (missing data), or if the difference yields a negative value (e.g., meter reset/rollover), the result defaults strictly to `null`. A `Data Quality` flag column will be mapped and output as `bad` (otherwise `healthy`).

## 4. Aggregation Rules
Once the raw or delta data is defined, the system aggregates it according to user configuration:
* **Calculation Step (Grouping/Output Frequency)**: Determines how data is bucketed over time. Options: `Raw` (No grouping), `Hourly`, `Daily`, `Monthly`, `Yearly`.
* **Calculation Type (Function)**: The mathematical operation used to aggregate the grouped buckets: `None`, `Mean`, `Sum`, `Count`, `Min`, `Max`.

## 5. Dependency & Sequence Engine
Since Vtags can reference combinations of Ptags and other Vtags, execution priority in Synapse is paramount.
* **Calculation Level**: Represents the execution sequence level.
  * Base Ptags represent Level `0`.
  * The Calculation Level is **automatically inferred** by the frontend. It is calculated as `Highest dependent tag level + 1`. (e.g., A formula using only Ptags is Level `1`. A formula using a Level 1 Vtag is Level `2`).
* **Cascading Updates**: If a Vtag is updated resulting in a new Calculation Level, the system automatically runs a dependency tree update in the background, recalculating and bumping the sequence levels of all parent Vtags that rely on it to prevent Synapse cyclic gridlocks.

## 6. Formula Builder & UX
* **Hybrid Drag-and-Drop Canvas**: The builder acts as an input zone that reads linearly (left-to-right, like a sentence).
  * **Palette**: A searchable sidebar housing available Ptags, calculated Vtags, conditionals (`IF`, `AND`, `OR`, `==`, `>`, `<`), and operators (`+`, `-`, `*`, `/`, `(`, `)`).
  * **Interactions**: 
    1. Users can drag pill-tokens from the palette and drop them into the sequence.
    2. Users can seamlessly type using their keyboard to input numbers, logic strings, operators, and constants directly inline with the dragged tokens. 
* **Backend Export Contract**: The result is serialized into a JSON structure, preserving token sequence, variables, effective dates, and data types, written to an Azure Table for Synapse consumption.
