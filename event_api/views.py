from rest_framework import viewsets
from rest_framework.response import Response
from .models import *
from .serializers import *
import datetime
from .tasks import mail_handler

mail_handler()


class EventSet(viewsets.ViewSet):

    def list(self, request):
        user_id = request.GET.get('user')
        content = request.GET.get('content', '')
        user = User.objects.get(pk=user_id)
        date = request.GET.get('date', None)
        events = Event.objects.filter(title__icontains=content, user=user)
        if date:
            event = events.order_by('-date')[0]
            if date == 'month':
                events = events.filter(date__gte=datetime.datetime(
                    event.date.year,
                    event.date.month,
                    1
                ))
            elif date == 'week':
                events = events.filter(date__gte=event.date-datetime.timedelta(days=7))
            elif date == 'day':
                events = events.filter(date__gte=datetime.datetime(
                    event.date.year,
                    event.date.month,
                    event.date.day
                ))
        serializer = EventCRUDSerializer(events, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk):
        event = Event.objects.get(pk=pk)
        serializer = EventCRUDSerializer(event)
        return Response(serializer.data, status=200)

    def create(self, request):
        serializer = EventCRUDSerializer(data=request.POST)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(EventCRUDSerializer(obj).data)
        else:
            return Response(serializer.errors)

    def update(self, request, pk):
        instance = Event.objects.get(pk=pk)
        serializer = EventCRUDSerializer(data=request.POST, instance=instance)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(EventCRUDSerializer(obj).data)
        else:
            return Response(serializer.errors)

    def delete(self, request, pk):
        instance = Event.objects.get(pk=pk)
        instance.delete()
        return Response(status=200)
