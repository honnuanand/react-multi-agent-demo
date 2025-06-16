import os
import httpx
import asyncio
from dotenv import load_dotenv

async def list_serving_endpoints():
    # Load environment variables
    load_dotenv()
    
    # Get credentials from environment
    api_key = os.getenv("DATABRICKS_API_KEY")
    workspace_url = os.getenv("DATABRICKS_API_URL")
    
    if not api_key or not workspace_url:
        print("Error: DATABRICKS_API_KEY and DATABRICKS_API_URL must be set in .env")
        return
    
    # Clean up workspace URL (remove trailing slash if present)
    workspace_url = workspace_url.rstrip('/')
    
    # API endpoints
    endpoints_url = f"{workspace_url}/api/2.0/serving-endpoints"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # Get list of all serving endpoints
            print("\nFetching serving endpoints...")
            resp = await client.get(endpoints_url, headers=headers, timeout=30.0)
            resp.raise_for_status()
            endpoints = resp.json().get("endpoints", [])
            
            if not endpoints:
                print("No serving endpoints found.")
                return
            
            print(f"\nFound {len(endpoints)} serving endpoints:")
            print("-" * 80)
            
            # Get details for each endpoint
            for endpoint in endpoints:
                name = endpoint.get("name")
                state = endpoint.get("state", {})
                ready = state.get("ready", False)
                
                print(f"\nEndpoint: {name}")
                print(f"Status: {'Ready' if ready else 'Not Ready'}")
                
                # Get detailed configuration
                detail_url = f"{workspace_url}/api/2.0/serving-endpoints/{name}"
                detail_resp = await client.get(detail_url, headers=headers, timeout=30.0)
                detail_resp.raise_for_status()
                details = detail_resp.json()
                
                # Print serving URL
                serving_url = f"{workspace_url}/serving-endpoints/{name}/invocations"
                print(f"Serving URL: {serving_url}")
                
                # Print model configuration
                config = details.get("config", {})
                if config:
                    print("\nModel Configuration:")
                    for key, value in config.items():
                        print(f"  {key}: {value}")
                
                print("-" * 80)
                
    except httpx.HTTPStatusError as e:
        print(f"HTTP Error: {e.response.status_code}")
        print(f"Response: {e.response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(list_serving_endpoints()) 