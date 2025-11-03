from django.db import models


class Conversation(models.Model):
    conversation_pk = models.IntegerField(unique=True)
    title = models.CharField(max_length=200, default="New Chat")
    user_id = models.IntegerField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated"]
        indexes = [
            models.Index(fields=["-updated"], name="chat_conversation_updated_idx"),
        ]

    def __str__(self):
        return f"Conversation {self.conversation_pk} - {self.title}"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, related_name="messages", on_delete=models.CASCADE
    )
    message_id = models.IntegerField()
    query = models.TextField()
    response = models.TextField()
    sources = models.JSONField(default=list, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created"]
        indexes = [
            models.Index(
                fields=["conversation", "created"], name="chat_message_conv_created_idx"
            ),
        ]

    def __str__(self):
        return f"Message {self.message_id} in Conversation {self.conversation.conversation_pk}"
