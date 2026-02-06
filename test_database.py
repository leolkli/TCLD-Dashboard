"""Test the updated database.py queries"""
import sys
sys.path.insert(0, 'c:\\Users\\leolkli\\DataWrang\\TCLD-CBSEMP-Dash')

from database import get_buildings, get_areas, get_eaptag_data, get_dashboard_metrics, test_connection

print("=" * 80)
print("Testing database connection...")
print("=" * 80)

if test_connection():
    print("✓ Database connection successful")
else:
    print("✗ Database connection failed")
    sys.exit(1)

print("\n" + "=" * 80)
print("Testing get_buildings()...")
print("=" * 80)

buildings = get_buildings()
if buildings:
    print(f"✓ Retrieved {len(buildings)} buildings")
    print(f"  Sample: {buildings[0]}")
else:
    print("✗ No buildings retrieved")

if buildings and len(buildings) > 0:
    building_id = buildings[0].get('BuildingID') or buildings[0].get('buildingId')
    
    print("\n" + "=" * 80)
    print(f"Testing get_areas() for building {building_id}...")
    print("=" * 80)
    
    areas = get_areas(building_id)
    if areas:
        print(f"✓ Retrieved {len(areas)} areas")
        print(f"  Sample: {areas[0]}")
    else:
        print("✗ No areas retrieved")

print("\n" + "=" * 80)
print("Testing get_eaptag_data()...")
print("=" * 80)

eaptag_data = get_eaptag_data(limit=5)
if eaptag_data:
    print(f"✓ Retrieved {len(eaptag_data)} EA Ptag records")
    print(f"  Sample: {eaptag_data[0]}")
else:
    print("✗ No EA Ptag data retrieved")

print("\n" + "=" * 80)
print("Testing get_dashboard_metrics()...")
print("=" * 80)

metrics = get_dashboard_metrics()
if metrics:
    print(f"✓ Retrieved metrics")
    print(f"  Total Energy: {metrics.get('totalEnergyConsumption')}")
    print(f"  Average: {metrics.get('averageConsumption')}")
    print(f"  Record Count: {metrics.get('recordCount')}")
else:
    print("✗ No metrics retrieved")

print("\n" + "=" * 80)
print("All tests completed!")
print("=" * 80)
