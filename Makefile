.PHONY: runDev runProd build-frontend clean-static run-be run-fe setup-be setup-fe

setup-be:
	cd backend && python3 -m venv venv
	cd backend && . venv/bin/activate && pip install --upgrade pip
	cd backend && . venv/bin/activate && pip install -r requirements.txt
	cd backend && . venv/bin/activate && pip install itsdangerous

setup-fe:
	cd frontend && npm install

runDev: setup-be setup-fe
	cd backend && . venv/bin/activate && uvicorn app:app --reload --port 8000 &
	cd frontend && npm run dev

run-be: setup-be
	cd backend && . venv/bin/activate && uvicorn app:app --reload --port 8000

run-fe: setup-fe
	cd frontend && npm run dev

build-frontend: setup-fe
	cd frontend && npm run build

clean-static:
	rm -rf backend/static

runProd: build-frontend clean-static
	cp -r frontend/dist backend/static
	cd backend && . venv/bin/activate && uvicorn app:app --host 0.0.0.0 --port 8000 