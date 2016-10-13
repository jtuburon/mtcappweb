from openmtc_app import NA, ContentSubscription
from openmtc_app.flask_runner import FlaskRunner
import time

import sys
class MyDA(NA):


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
        def runner():
            while self.RUNNING:
                try:
                    self.emit("clock", "13:00:00")
                except Exception:
                    self.logger.exception("Error in runner")

        Thread(target=runner).start()

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