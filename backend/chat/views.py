import requests
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from utils.maizey_client import MaizeyClient
from django.db.models import Count

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    MessageRequestSerializer,
    MessageSerializer,
)


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    lookup_field = "conversation_pk"

    def get_queryset(self):
        return Conversation.objects.annotate(
            message_count=Count("messages")
        ).order_by("-updated")

    def create(self, request, *args, **kwargs):
        try:
            client = MaizeyClient()
            maizey_conversation = client.create_conversation()

            conversation, created = Conversation.objects.get_or_create(
                conversation_pk=maizey_conversation["pk"],
                defaults={
                    "title": maizey_conversation["title"],
                    "user_id": maizey_conversation["user_id"],
                },
            )

            serializer = self.get_serializer(conversation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except requests.RequestException as e:
            return Response(
                {"error": f"Failed to connect to Maizey API: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except KeyError as e:
            return Response(
                {"error": f"Invalid response from Maizey API: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

    @action(detail=True, methods=["GET"], url_path="messages")
    def messages(self, request, conversation_pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all().order_by('created')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["POST"], url_path="messages/send")
    def send_message(self, request, conversation_pk=None):
        conversation = self.get_object()
        serializer = MessageRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            client = MaizeyClient()
            maizey_message = client.send_message(
                conversation_pk, serializer.validated_data["query"]
            )

            message, created = Message.objects.get_or_create(
                message_id=maizey_message["id"],
                conversation=conversation,
                defaults={
                    "query": maizey_message["query"],
                    "response": maizey_message["response"],
                    "sources": maizey_message.get("sources", []),
                },
            )
            return Response(maizey_message, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": f"Failed to send message: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )