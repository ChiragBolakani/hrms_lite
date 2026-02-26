import requests
import random
from faker import Faker

URL = "http://localhost:8000/api/v1/employees/"
TOTAL_EMPLOYEES = 20

fake = Faker()
Faker.seed(42)

def create_employee(employee_number):
    first_name = fake.first_name()
    last_name = fake.last_name()
    department = random.randint(1, 4)

    # Ensure unique email using faker's unique generator
    email = fake.unique.email()
    
    # Generate employee_id (e.g., EMP001, EMP002, etc.)
    employee_id = f"EMP{employee_number:03d}"

    return {
        "employee_id": employee_id,
        "full_name": f"{first_name} {last_name}",
        "email": email,
        "department": department
    }

def main():
    print(f"Seeding {TOTAL_EMPLOYEES} employees...\n")

    success_count = 0
    failure_count = 0

    for i in range(1, TOTAL_EMPLOYEES + 1):
        employee = create_employee(i)

        try:
            response = requests.post(URL, json=employee)

            if response.status_code in (200, 201):
                print(f"✅ Created: {employee['full_name']} ({employee['employee_id']}) - Dept {employee['department']}")
                success_count += 1
            else:
                print(f"❌ Failed ({response.status_code}): {response.text}")
                failure_count += 1

        except Exception as e:
            print(f"⚠️ Request error: {e}")
            failure_count += 1

    print("\n--- Summary ---")
    print(f"Success: {success_count}")
    print(f"Failed: {failure_count}")

if __name__ == "__main__":
    main()