"""
RAG Service - Retrieval Augmented Generation for CBAM documents
Uses ChromaDB for vector storage and sentence-transformers for embeddings
"""

import os
from typing import List, Optional, Dict, Any
import asyncio
from pathlib import Path

# Lazy imports for optional dependencies
_chroma_client = None
_embedding_model = None


# CBAM Knowledge Base - Built-in documents
CBAM_KNOWLEDGE_BASE = [
    {
        "id": "cbam_overview",
        "title": "CBAM Genel Bakış",
        "content": """
        Karbon Sınır Düzenleme Mekanizması (CBAM), Avrupa Birliği'nin karbon kaçağını önlemek için 
        uygulamaya koyduğu bir mekanizmadır. AB dışından ithal edilen belirli ürünlerin karbon 
        içeriğine göre bir bedel ödenmesini gerektirmektedir.
        
        CBAM kapsamındaki sektörler:
        - Çelik ve demir
        - Alüminyum
        - Çimento
        - Gübre
        - Elektrik
        - Hidrojen
        
        Takvim:
        - 2023-2025: Geçiş dönemi (sadece raporlama)
        - 2026: Kademeli uygulama başlangıcı (%22.5)
        - 2027-2033: Kademeli artış
        - 2034: Tam uygulama (%100)
        """,
    },
    {
        "id": "cbam_calculation",
        "title": "CBAM Maliyet Hesaplama",
        "content": """
        CBAM maliyeti şu formülle hesaplanır:
        
        CBAM Maliyeti = İthal Edilen Ürün Miktarı × Gömülü Emisyonlar × CBAM Sertifika Fiyatı
        
        Gömülü Emisyonlar:
        - Scope 1: Doğrudan üretimden kaynaklanan emisyonlar
        - Scope 2: Satın alınan elektrikten kaynaklanan emisyonlar
        - Scope 3: Tedarik zinciri emisyonları (bazı ürünler için)
        
        CBAM Sertifika Fiyatı:
        - AB ETS (Emisyon Ticaret Sistemi) fiyatına bağlıdır
        - 2024: ~80-90 EUR/tCO2
        - 2030 tahmini: 100-150 EUR/tCO2
        
        Örnek hesaplama:
        - 10,000 ton çelik ithalatı
        - Gömülü emisyon: 1.85 tCO2/ton çelik
        - ETS fiyatı: 90 EUR/tCO2
        - CBAM Maliyeti: 10,000 × 1.85 × 90 = 1,665,000 EUR
        """,
    },
    {
        "id": "emission_scopes",
        "title": "Emisyon Kapsamları (Scope 1, 2, 3)",
        "content": """
        Sera gazı emisyonları üç kapsama ayrılır:
        
        SCOPE 1 - Doğrudan Emisyonlar:
        - Şirketin sahip olduğu veya kontrol ettiği kaynaklardan
        - Fabrika bacaları, şirket araçları, ısıtma sistemleri
        - Örnek: Doğalgaz yakma, dizel jeneratör
        
        SCOPE 2 - Dolaylı Enerji Emisyonları:
        - Satın alınan elektrik, buhar, ısıtma, soğutma
        - Şebeke elektriğinin üretiminden kaynaklanan emisyonlar
        - Türkiye şebeke emisyon faktörü: ~0.5 kgCO2/kWh
        
        SCOPE 3 - Diğer Dolaylı Emisyonlar:
        - Tedarik zinciri, çalışan ulaşımı, ürün kullanımı
        - Hammadde üretimi, lojistik, atık bertarafı
        - Genellikle toplam emisyonların %70-90'ını oluşturur
        
        CBAM için öncelikli: Scope 1 ve Scope 2
        """,
    },
    {
        "id": "green_financing",
        "title": "Yeşil Finansman Seçenekleri",
        "content": """
        CBAM maliyetlerini azaltmak için yeşil yatırımlar kritik öneme sahiptir:
        
        1. YEŞİL ENERJİ KREDİSİ
        - Amaç: Güneş, rüzgar, biyogaz yatırımları
        - Faiz: %1.49 (piyasanın altında)
        - Vade: 84 aya kadar
        - Ödemesiz dönem: 6 ay
        - Potansiyel emisyon azaltımı: %40-60
        
        2. ENERJİ VERİMLİLİĞİ KREDİSİ
        - Amaç: LED, motor değişimi, yalıtım
        - Faiz: %1.79
        - Vade: 60 aya kadar
        - ROI: Genellikle 3-5 yıl
        - Potansiyel tasarruf: %15-30
        
        3. TEMİZ TEKNOLOJİ KREDİSİ
        - Amaç: Elektrikli fırın, hidrojen, karbon yakalama
        - Faiz: %1.99
        - Vade: 72 aya kadar
        - Uzun vadeli dönüşüm için
        
        Garanti BBVA yeşil finansman avantajları:
        - Düşük faiz oranları
        - Teknik danışmanlık desteği
        - Karbon ayak izi hesaplama
        - CBAM raporlama yardımı
        """,
    },
    {
        "id": "sector_benchmarks",
        "title": "Sektörel Emisyon Referans Değerleri",
        "content": """
        AB CBAM için sektörel emisyon referans değerleri:
        
        DEMİR-ÇELİK:
        - Entegre tesis: 1.85 tCO2/ton çelik
        - EAF (elektrik ark ocağı): 0.35 tCO2/ton çelik
        - Türkiye ortalaması: 1.2 tCO2/ton çelik
        
        ALÜMİNYUM:
        - Birincil alüminyum: 8-16 tCO2/ton
        - İkincil (geri dönüşüm): 0.5-2 tCO2/ton
        - Türkiye ortalaması: 6.5 tCO2/ton
        
        ÇİMENTO:
        - Portland çimento: 0.65-0.85 tCO2/ton
        - Katkılı çimento: 0.5-0.7 tCO2/ton
        - Türkiye ortalaması: 0.72 tCO2/ton
        
        GÜBRE:
        - Amonyum nitrat: 6.5 tCO2/ton
        - Üre: 2.0 tCO2/ton
        - Türkiye ortalaması: 3.2 tCO2/ton
        
        Bu değerler AB'ye ihracat yapan firmalar için kritik öneme sahiptir.
        Sektör ortalamasının üzerindeki firmalar daha yüksek CBAM maliyeti ödeyecektir.
        """,
    },
]


class RAGService:
    """RAG Service for CBAM document retrieval"""

    def __init__(self):
        self._initialized = False
        self._collection = None

    def _get_embedding_model(self):
        """Lazy load embedding model"""
        global _embedding_model
        if _embedding_model is None:
            try:
                from sentence_transformers import SentenceTransformer

                _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
            except ImportError:
                return None
        return _embedding_model

    def _get_chroma_client(self):
        """Lazy load ChromaDB client"""
        global _chroma_client
        if _chroma_client is None:
            try:
                import chromadb

                _chroma_client = chromadb.Client()
            except ImportError:
                return None
        return _chroma_client

    async def initialize(self):
        """Initialize the RAG service with CBAM knowledge base"""
        if self._initialized:
            return True

        client = self._get_chroma_client()
        model = self._get_embedding_model()

        if client is None or model is None:
            # Fall back to simple keyword search
            self._initialized = True
            return False

        # Create or get collection
        try:
            self._collection = client.get_or_create_collection(
                name="cbam_knowledge", metadata={"hnsw:space": "cosine"}
            )

            # Check if already populated
            if self._collection.count() == 0:
                # Add documents
                ids = [doc["id"] for doc in CBAM_KNOWLEDGE_BASE]
                documents = [doc["content"] for doc in CBAM_KNOWLEDGE_BASE]
                metadatas = [{"title": doc["title"]} for doc in CBAM_KNOWLEDGE_BASE]

                # Generate embeddings
                embeddings = model.encode(documents).tolist()

                self._collection.add(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas,
                    embeddings=embeddings,
                )

            self._initialized = True
            return True

        except Exception as e:
            print(f"RAG initialization error: {e}")
            self._initialized = True
            return False

    async def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Search for relevant documents"""
        await self.initialize()

        model = self._get_embedding_model()

        if self._collection is not None and model is not None:
            # Vector search
            query_embedding = model.encode([query]).tolist()

            results = self._collection.query(
                query_embeddings=query_embedding, n_results=top_k
            )

            documents = []
            for i, doc in enumerate(results["documents"][0]):
                documents.append(
                    {
                        "content": doc,
                        "title": results["metadatas"][0][i].get("title", ""),
                        "score": (
                            1 - results["distances"][0][i]
                            if "distances" in results
                            else 1.0
                        ),
                    }
                )

            return documents

        # Fallback: simple keyword matching
        return self._simple_search(query, top_k)

    def _simple_search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Simple keyword-based search fallback"""
        query_lower = query.lower()
        scores = []

        for doc in CBAM_KNOWLEDGE_BASE:
            content_lower = doc["content"].lower()
            title_lower = doc["title"].lower()

            # Count keyword matches
            score = 0
            for word in query_lower.split():
                if len(word) > 2:
                    score += content_lower.count(word)
                    score += title_lower.count(word) * 2  # Title matches weight more

            if score > 0:
                scores.append(
                    {"content": doc["content"], "title": doc["title"], "score": score}
                )

        # Sort by score and return top_k
        scores.sort(key=lambda x: x["score"], reverse=True)
        return scores[:top_k]

    async def get_context(self, query: str) -> str:
        """Get RAG context for a query"""
        results = await self.search(query, top_k=2)

        if not results:
            return ""

        context_parts = []
        for doc in results:
            context_parts.append(f"### {doc['title']}\n{doc['content'].strip()}")

        return "\n\n".join(context_parts)


# Global RAG service instance
rag_service = RAGService()


async def get_rag_context(query: str) -> str:
    """Helper function to get RAG context"""
    return await rag_service.get_context(query)
