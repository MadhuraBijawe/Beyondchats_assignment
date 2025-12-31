from django.shortcuts import render

# Create your views here.
from rest_framework.viewsets import ModelViewSet
from .models import Article
from .serializers import ArticleSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
import subprocess
import os

class ArticleViewSet(ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

    @action(detail=True, methods=['post'])
    def enhance(self, request, pk=None):
        """Trigger the external enhancer script for this article.

        This will try to start the Node enhancer in the background and return 202.
        The server running Django must have `node` available for this to work.
        """
        article = self.get_object()
        # Attempt to start the enhancer script (non-blocking).
        try:
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
            enhancer_path = os.path.join(base_dir, 'articles', 'enhancer', 'src', 'index.js')
            if not os.path.exists(enhancer_path):
                return Response({'detail': 'Enhancer script not found on server.'}, status=404)

            # Start the enhancer with DRY_RUN=0 to allow publishing. This runs in background.
            subprocess.Popen(['node', enhancer_path], cwd=os.path.dirname(enhancer_path))
            return Response({'detail': 'Enhancer started'}, status=202)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)
