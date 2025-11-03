from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message


@receiver(post_save, sender=Message)
def update_conversation_updated(sender, instance, **kwargs):
    """Update conversation updated timestamp when a message is added."""
    instance.conversation.save(update_fields=['updated'])