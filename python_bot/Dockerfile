FROM python:3.10-slim
ENV TZ=Asia/Jakarta
RUN apt-get update && apt-get install -y tzdata fonts-dejavu-core libfreetype6-dev && rm -rf /var/lib/apt/lists/*
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY bot_wa_dual_master.py .
EXPOSE 5555
CMD ["python", "bot_wa_dual_master.py"]
