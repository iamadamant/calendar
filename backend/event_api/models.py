from django.contrib.auth.models import User
from django.db import models

# Create your models here.

class Event(models.Model):
    title = models.CharField(max_length=256)
    date = models.DateTimeField()
    description = models.CharField(null=True, blank=True, max_length=1024)
    user = models.ForeignKey(User, related_name='events', on_delete=models.CASCADE)
    checked = models.BooleanField()

    def __str__(self):
        return 'Title: {}, Date: {}'.format(self.title, self.date)