# Makefile for backend tasks

.PHONY: test run

test:
	pytest --maxfail=20 --disable-warnings -v > test_results.txt; \
	echo "\nTest Summary Table:"; \
	echo "| Test Name                                 | Status  |"; \
	echo "|---------------------------------------------|---------|"; \
	grep -E 'PASSED|FAILED|SKIPPED' test_results.txt | awk '{printf "| %-43s | %-7s |\n", $$1, $$2}'

run:
	uvicorn app:app --reload --port 8000 