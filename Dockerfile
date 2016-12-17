FROM python:3.5
MAINTAINER Konrad Lisiczynski <klisiczynski@gmail.com>
COPY requirements.txt /app/
WORKDIR /app
RUN pip install -r requirements.txt
COPY app /app/app/
COPY manage.py /app/
COPY migrations /app/migrations/
COPY runserver.py /app/
COPY config.py /app/
EXPOSE 5000
CMD ["python", "runserver.py"]
