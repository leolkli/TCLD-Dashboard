
export interface SynapseBuilding {
  code: string;
  name: string;
}

export interface SynapsePortfolio {
  name: string;
  buildings: SynapseBuilding[];
}

export interface SynapsePTag {
  Name: string;
  Code: string;
  System: string;
  UOM: string;
  F_tablename: string;
  Commodity: string;
}

export interface BuildingTagsResponse {
  physicalTags: SynapsePTag[];
  virtualTags: any[];
}
