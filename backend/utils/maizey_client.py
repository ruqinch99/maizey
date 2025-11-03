import requests
from typing import Dict, Any
from django.conf import settings


class MaizeyClient:
    def __init__(
        self, api_token: str = None, project_pk: str = None, base_url: str = None
    ):
        self.api_token = api_token or settings.MAIZEY_API_TOKEN
        self.project_pk = project_pk or settings.MAIZEY_PROJECT_PK
        self.base_url = base_url or settings.MAIZEY_API_BASE_URL

        if not self.api_token:
            raise ValueError("MAIZEY_API_TOKEN is required")
        if not self.project_pk:
            raise ValueError("MAIZEY_PROJECT_PK is required")

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

    def create_conversation(self) -> Dict[str, Any]:
        url = f"{self.base_url}/projects/{self.project_pk}/conversation/"
        response = requests.post(url, headers=self._get_headers())
        response.raise_for_status()
        return response.json()

    def send_message(self, conversation_pk: int, query: str) -> Dict[str, Any]:
        url = f"{self.base_url}/projects/{self.project_pk}/conversation/{conversation_pk}/messages/"
        payload = {"query": query}
        response = requests.post(url, json=payload, headers=self._get_headers())
        response.raise_for_status()
        return response.json()
