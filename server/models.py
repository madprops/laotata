from django.db import models
from django.contrib.auth.models import User
import datetime

class Channel(models.Model):
	name = models.CharField(max_length=20)

class Post(models.Model):
	channel = models.ForeignKey(Channel)
	extension = models.CharField(max_length=10)
	date = models.DateTimeField(default=datetime.datetime.now())
	last = models.DateTimeField(default=datetime.datetime.now())
	ip = models.CharField(max_length=20)

class Reply(models.Model):
	post = models.ForeignKey(Post)
	text = models.TextField(max_length=10000)
	date = models.DateTimeField(default=datetime.datetime.now())
	ip = models.CharField(max_length=20)
