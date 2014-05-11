from django.conf.urls import patterns, include, url
from django.contrib import admin
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

urlpatterns = patterns('',
    (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': BASE_DIR + '/media/'}),
    (r'^reply/$', 'server.views.reply'),
    (r'^get_replies/$', 'server.views.get_replies'),
    (r'^refresh_replies/$', 'server.views.refresh_replies'),
    (r'^help/$', 'server.views.help'),
    (r'^help$', 'server.views.help'),
    (r'^(?P<channel>\w+)$', 'server.views.open_channel'),
    (r'^$', 'server.views.main'),
)
