from rest_framework import serializers
from .models import Conversation, Message


class MessageRequestSerializer(serializers.Serializer):
    query = serializers.CharField(
        max_length=1000,
        required=True,
        help_text="The message query to send to Maizey"
    )

class ConversationSerializer(serializers.ModelSerializer):
    message_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['conversation_pk', 'title', 'created', 'updated', 'message_count']

class MessageSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='message_id')
    conversation_id = serializers.SerializerMethodField() 
    
    def get_conversation_id(self, obj):
        return obj.conversation.conversation_pk

    class Meta:
        model = Message
        fields = ['id', 'conversation_id', 'query', 'response', 'sources', 'created']