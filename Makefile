.PHONY: runDev runProd build-frontend clean-static run-be run-fe

runDev:
	cd backend && source venv/bin/activate && uvicorn app:app --reload --port 8000 &
	cd frontend && npm install && npm run dev

run-be:
	cd backend && source venv/bin/activate && uvicorn app:app --reload --port 8000

run-fe:
	cd frontend && npm install && npm run dev

build-frontend:
	cd frontend && npm install && npm run build

clean-static:
	rm -rf backend/static

runProd: build-frontend clean-static
	cp -r frontend/dist backend/static
	cd backend && source venv/bin/activate && uvicorn app:app --host 0.0.0.0 --port 8000 