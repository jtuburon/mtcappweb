from openmtc_app import NA, ContentSubscription
from openmtc_app.flask_runner import FlaskRunner
import time

import sys
import Adafruit_DHT

class MyDA(NA):
	def read_sensor_data(self):
		sensor_args = {'11': Adafruit_DHT.DHT11,
		'22': Adafruit_DHT.DHT22,
		'2302': Adafruit_DHT.AM2302 }
		sensor = sensor_args['11']
		gpio = 4
		humidity, temperature = Adafruit_DHT.read_retry(sensor, gpio)
		return {
			"humidity": humidity, 
			"temperature":temperature
		}


	def _handle_consumption_application(self, application):
		print self
		event = {
		    "id": application.appId,
		    "type": "enyport"
		}
		self.emit("new_consumption_app", application.appId)
		self.__apps.append(application)
	
	def _handle_consumption_data(self, application, container, data):
		print data
		data = data[-1]
		print data
		self.emit("consumption_data", data)
		l = self.__data[data["appId"]]
		l.append(data)
		self.__data[data["appId"]] = l[-self.MAX_ITEMS:]

	def _on_register(self):
		try:
			mtcApp = self.mapper.get("/applications/mtcApp")
		except:
			mtcApp = self.create_application("mtcApp", "/applications")		
		# container= self.create_container(mtcApp, "sensordata")

		subscription = ContentSubscription(
			None,
			("sensordata"), 
			application_search_strings="mtcApp",
            application_handler=self._handle_consumption_application,
            content_handler=self._handle_consumption_data)
		self.add_content_subscription(subscription)
		print "WAPIE"
		
app_instance = MyDA() 
runner = FlaskRunner(app_instance,  port=5051)

NSCL_URL="http://192.168.254.128:4000"
runner.run(NSCL_URL) 