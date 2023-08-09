# Start with the python:3.9 image
FROM python:3.9

# Set the following environment variables
ENV REACT_APP_BASE_URL=https://wealthwise-764ce4087eee.herokuapp.com/
ENV FLASK_APP=app
ENV FLASK_ENV=production
ENV SQLALCHEMY_ECHO=True

# Set the directory for upcoming commands to /var/www
WORKDIR /var/www

# Copy all the files from your repo to the working directory
COPY . .

# Copy the built react app (it's built for us) from the
# /react-app/build/ directory into your flask app/static directory
COPY /react-app/build/* app/static/

# Install necessary Python packages including finnhub
RUN pip install -r requirements.txt
RUN pip install psycopg2
# ... (previous content)
# Install necessary Python packages including finnhub-python
RUN pip install -r requirements.txt
RUN pip install psycopg2
#Corrected package name
RUN pip install finnhub-python 

# Start the flask environment by setting our
# closing command to gunicorn app:app
CMD gunicorn app:app
