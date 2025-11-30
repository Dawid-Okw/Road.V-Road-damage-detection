from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class SupabaseClientService:
    def __init__(self, url: str = None, key: str = None):
        self.url = url or settings.supabase_url
        self.key = key or settings.supabase_key
        self._client = None
    
    def get_client(self) -> Client:
        if self._client is None:
            self._client = create_client(self.url, self.key)
        return self._client
    
    def test_connection(self) -> bool:
        try:
            client = self.get_client()
            # Test connection by querying the road_damage table
            client.table('road_damage').select('id').limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Supabase connection test failed: {e}")
            return False
