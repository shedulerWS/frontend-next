SHELL    := /bin/bash
PID_FILE := .next-dev.pid
LOG_FILE := .next-dev.log
PORT     := 3000

.PHONY: up down

up:
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "frontend-next: already running (pid $$(cat $(PID_FILE)))"; \
		exit 0; \
	fi
	@rm -f $(PID_FILE)
	@nohup npm run dev > $(LOG_FILE) 2>&1 & echo $$! > $(PID_FILE)
	@echo "frontend-next: started (pid $$(cat $(PID_FILE))), logs: $(LOG_FILE)"

down:
	@if [ -f $(PID_FILE) ]; then \
		PID=$$(cat $(PID_FILE)); \
		pkill -P $$PID 2>/dev/null || true; \
		kill $$PID 2>/dev/null || true; \
		rm -f $(PID_FILE); \
	fi
	@PIDS=$$(lsof -ti:$(PORT) 2>/dev/null); \
	if [ -n "$$PIDS" ]; then \
		echo $$PIDS | xargs kill 2>/dev/null || true; \
	fi
	@echo "frontend-next: stopped"
