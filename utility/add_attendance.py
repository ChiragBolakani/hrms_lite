import requests
import random
from datetime import datetime, timedelta

URL = "http://localhost:8000/api/v1/attendance/"
EMPLOYEES_URL = "http://localhost:8000/api/v1/employees/"

DAYS_BACK = 10
# Set seed for reproducible results
random.seed(42)


def fetch_employees():
    """Fetch the first 20 employees from the API"""
    try:
        response = requests.get(f"{EMPLOYEES_URL}?page_size=20")
        if response.status_code == 200:
            data = response.json()
            employees = data.get('results', [])
            return employees
        else:
            print(f"❌ Failed to fetch employees: {response.status_code}")
            return []
    except Exception as e:
        print(f"⚠️ Error fetching employees: {e}")
        return []


def get_last_n_days(n):
    """Generate list of dates for the last n days"""
    today = datetime.now().date()
    dates = []
    for i in range(n):
        date = today - timedelta(days=i)
        dates.append(date.strftime("%Y-%m-%d"))
    return dates


def create_attendance(employee_id, date, status):
    """Create an attendance record via API"""
    payload = {
        "employee": employee_id,
        "date": date,
        "status": status
    }
    
    try:
        response = requests.post(URL, json=payload)
        
        if response.status_code in (200, 201):
            return True, None
        elif response.status_code == 409:
            # Duplicate record - already exists
            return False, "duplicate"
        else:
            return False, f"error_{response.status_code}"
    except Exception as e:
        return False, f"exception_{str(e)}"


def main():
    print("Fetching employees from API...")
    employees = fetch_employees()
    
    if not employees:
        print("❌ No employees found. Please create employees first using add_employees.py")
        return
    
    # Limit to first 20 employees
    employees = employees[:20]
    
    print(f"Creating attendance records for {len(employees)} employees for the last {DAYS_BACK} days...\n")
    
    dates = get_last_n_days(DAYS_BACK)
    total_records = len(employees) * len(dates)
    
    success_count = 0
    duplicate_count = 0
    failure_count = 0
    
    for employee in employees:
        employee_id = employee["id"]
        employee_name = employee.get("full_name", "Unknown")
        employee_emp_id = employee.get("employee_id", "N/A")
        
        for date in dates:
            # Randomly assign status: 85% PRESENT, 15% ABSENT
            status = "PRESENT" if random.random() < 0.85 else "ABSENT"
            
            success, error = create_attendance(employee_id, date, status)
            
            if success:
                success_count += 1
            elif error == "duplicate":
                duplicate_count += 1
            else:
                failure_count += 1
                print(f"❌ Failed: {employee_name} ({employee_emp_id}) on {date} - {error}")
        
        print(f"✅ Processed: {employee_name} ({employee_emp_id}) - ID: {employee_id}")
    
    print("\n--- Summary ---")
    print(f"Total records attempted: {total_records}")
    print(f"✅ Successfully created: {success_count}")
    print(f"⚠️  Already existed (duplicates): {duplicate_count}")
    print(f"❌ Failed: {failure_count}")


if __name__ == "__main__":
    main()

