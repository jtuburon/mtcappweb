from optparse import OptionParser
from urllib2 import urlopen
from threading import Thread
from collections import defaultdict
from flask import Response
from json import dumps

from openmtc_app.flask_runner import FlaskRunner
from futile.contextlib import closing
from openmtc_app import ContentSubscription, NA


from openmtc_app import NA, ContentSubscription
from openmtc_app.flask_runner import FlaskRunner
import time

import sys
class MyDA(NA):

	MAX_ITEMS = 30
	RUNNING = True

	def _handle_consumption_application(self, application):
		print self
		event = {
		    "id": application.appId,
		    "type": "enyport"
		}
		self.emit("new_consumption_app", application.appId)
		self.__apps.append(application)
	
	def _handle_consumption_data(self, application, container, data):
		data = data[-1]
		print data
		self.emit("consumption_data", data)
		l = self.__data[data["appId"]]
		l.append(data)
		self.__data[data["appId"]] = l[-self.MAX_ITEMS:]


	def _get_initial(self, request):
		data = {
		    "data": self.__data
		}

		resp = Response(response=dumps(data),
		                status=200,
		                mimetype="application/json")
		return resp

	def _on_register(self):  

		self.__apps = []
		self.__data = defaultdict(list)

		self.runner.add_route("/initial", self._get_initial)

		subscription = ContentSubscription(
			None,
			containers=("sensordata",),
			application_handler=self._handle_consumption_application,
            content_handler=self._handle_consumption_data)
		self.add_content_subscription(subscription)
		print "WAPIE"
		
app_instance = MyDA() 
runner = FlaskRunner(app_instance,  port=5051)

NSCL_URL="http://192.168.254.128:4000"
runner.run(NSCL_URL) 