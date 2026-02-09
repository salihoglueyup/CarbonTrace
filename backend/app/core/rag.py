import os
from typing import List, Optional
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from app.core.config import settings
from app.core.llm_providers import LLMProviderFactory, LLMProvider


class RAGService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(api_key=settings.openai_api_key)
        self.vector_store_path = "app/data/vector_store"
        self.vector_store = None
        self._load_vector_store()

    def _load_vector_store(self):
        """Load existing vector store or create new one"""
        if os.path.exists(self.vector_store_path):
            try:
                self.vector_store = FAISS.load_local(
                    self.vector_store_path,
                    self.embeddings,
                    allow_dangerous_deserialization=True,
                )
            except Exception as e:
                print(f"Error loading vector store: {e}")
                self.vector_store = None
        else:
            self.vector_store = None

    async def ingest_document(self, file_path: str):
        """Process PDF and add to vector store"""
        loader = PyPDFLoader(file_path)
        pages = loader.load_and_split()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200
        )
        splits = text_splitter.split_documents(pages)

        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(splits, self.embeddings)
        else:
            self.vector_store.add_documents(splits)

        self.vector_store.save_local(self.vector_store_path)
        return len(splits)

    async def ask(self, question: str, provider: LLMProvider = LLMProvider.OPENAI):
        """Answer question using RAG"""
        if not self.vector_store:
            return "Henüz indislşemiş bir doküman bulunmuyor. Lütfen önce doküman yükleyin."

        retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})

        # Determine model based on provider
        # Note: We need to adapt the LLMProviderFactory to work with LangChain or use it directly
        # For simplicity in RAG, we might stick to OpenAI for now or wrap the others

        from langchain_openai import ChatOpenAI

        llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key)

        template = """Aşağıdaki bağlamı kullanarak soruyu cevapla.
        Bağlam:
        {context}
        
        Soru: {question}
        
        Cevap (Türkçe):"""

        prompt = ChatPromptTemplate.from_template(template)

        def format_docs(docs):
            return "\n\n".join([d.page_content for d in docs])

        rag_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )

        return await rag_chain.ainvoke(question)


rag_service = RAGService()
