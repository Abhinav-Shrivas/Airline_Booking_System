FROM node:22-alpine
WORKDIR /workspace

# Copy shared module (sibling of service, so ../shared works)
COPY shared/ ./shared/
RUN cd ./shared && npm ci

# Copy service files and install
COPY authService/ ./authService/
WORKDIR /workspace/authService
RUN npm ci --omit=dev

RUN chmod +x start.sh
CMD ["sh", "start.sh"]
