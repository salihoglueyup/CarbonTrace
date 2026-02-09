"""
LLM Providers - OpenAI, Google Gemini, Anthropic Claude
Multi-provider support with fallback mechanism
"""

import os
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, AsyncGenerator
from enum import Enum
import asyncio

from app.core.config import settings


class LLMProvider(str, Enum):
    OPENAI = "openai"
    GEMINI = "gemini"
    CLAUDE = "claude"
    LLAMA = "llama"


class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers"""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        """Generate a response from the LLM"""
        pass

    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming response from the LLM"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if this provider is available (has API key)"""
        pass


class OpenAIProvider(BaseLLMProvider):
    """OpenAI GPT-4 Provider"""

    def __init__(self):
        self.api_key = settings.openai_api_key
        self.model = "gpt-4o-mini"  # Cost effective, can upgrade to gpt-4o
        self._client = None

    @property
    def client(self):
        if self._client is None and self.is_available():
            from openai import AsyncOpenAI

            self._client = AsyncOpenAI(api_key=self.api_key)
        return self._client

    def is_available(self) -> bool:
        return bool(self.api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        if not self.is_available():
            raise ValueError("OpenAI API key not configured")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncGenerator[str, None]:
        if not self.is_available():
            raise ValueError("OpenAI API key not configured")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


class GeminiProvider(BaseLLMProvider):
    """Google Gemini Provider"""

    def __init__(self):
        self.api_key = settings.google_api_key
        self.model_name = "gemini-1.5-flash"
        self._model = None

    @property
    def model(self):
        if self._model is None and self.is_available():
            import google.generativeai as genai

            genai.configure(api_key=self.api_key)
            self._model = genai.GenerativeModel(self.model_name)
        return self._model

    def is_available(self) -> bool:
        return bool(self.api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        if not self.is_available():
            raise ValueError("Google API key not configured")

        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"

        # Gemini is sync, run in executor
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": temperature,
                    "max_output_tokens": max_tokens,
                },
            ),
        )

        return response.text

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncGenerator[str, None]:
        if not self.is_available():
            raise ValueError("Google API key not configured")

        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": temperature,
                    "max_output_tokens": max_tokens,
                },
                stream=True,
            ),
        )

        for chunk in response:
            if chunk.text:
                yield chunk.text


class ClaudeProvider(BaseLLMProvider):
    """Anthropic Claude Provider"""

    def __init__(self):
        self.api_key = settings.anthropic_api_key
        self.model = "claude-3-haiku-20240307"  # Fast and cost effective
        self._client = None

    @property
    def client(self):
        if self._client is None and self.is_available():
            from anthropic import AsyncAnthropic

            self._client = AsyncAnthropic(api_key=self.api_key)
        return self._client

    def is_available(self) -> bool:
        return bool(self.api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        if not self.is_available():
            raise ValueError("Anthropic API key not configured")

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system_prompt or "You are a helpful assistant.",
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncGenerator[str, None]:
        if not self.is_available():
            raise ValueError("Anthropic API key not configured")

        async with self.client.messages.stream(
            model=self.model,
            max_tokens=max_tokens,
            system=system_prompt or "You are a helpful assistant.",
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            async for text in stream.text_stream:
                yield text


class LlamaProvider(BaseLLMProvider):
    """Llama Provider via Groq Cloud API"""

    def __init__(self):
        self.api_key = settings.groq_api_key
        self.model = "llama-3.2-3b-preview"  # Fast and capable
        self._client = None

    @property
    def client(self):
        if self._client is None and self.is_available():
            from openai import AsyncOpenAI

            # Groq uses OpenAI-compatible API
            self._client = AsyncOpenAI(
                api_key=self.api_key, base_url="https://api.groq.com/openai/v1"
            )
        return self._client

    def is_available(self) -> bool:
        return bool(self.api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        if not self.is_available():
            raise ValueError("Groq API key not configured")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncGenerator[str, None]:
        if not self.is_available():
            raise ValueError("Groq API key not configured")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


class LLMProviderFactory:
    """Factory for creating and managing LLM providers"""

    _providers: Dict[LLMProvider, BaseLLMProvider] = {}

    @classmethod
    def get_provider(cls, provider: LLMProvider) -> BaseLLMProvider:
        """Get or create a provider instance"""
        if provider not in cls._providers:
            if provider == LLMProvider.OPENAI:
                cls._providers[provider] = OpenAIProvider()
            elif provider == LLMProvider.GEMINI:
                cls._providers[provider] = GeminiProvider()
            elif provider == LLMProvider.CLAUDE:
                cls._providers[provider] = ClaudeProvider()
            elif provider == LLMProvider.LLAMA:
                cls._providers[provider] = LlamaProvider()
            else:
                raise ValueError(f"Unknown provider: {provider}")

        return cls._providers[provider]

    @classmethod
    def get_default_provider(cls) -> BaseLLMProvider:
        """Get the default provider based on configuration"""
        default = settings.default_llm_provider

        # Try default first
        try:
            provider = LLMProvider(default)
            p = cls.get_provider(provider)
            if p.is_available():
                return p
        except (ValueError, KeyError):
            pass

        # Fallback: try each provider in order
        for provider in [LLMProvider.OPENAI, LLMProvider.GEMINI, LLMProvider.CLAUDE]:
            p = cls.get_provider(provider)
            if p.is_available():
                return p

        raise ValueError(
            "No LLM provider is available. Please configure at least one API key."
        )

    @classmethod
    def get_available_providers(cls) -> list[LLMProvider]:
        """Get list of available providers"""
        available = []
        for provider in LLMProvider:
            p = cls.get_provider(provider)
            if p.is_available():
                available.append(provider)
        return available


# CBAM-specific system prompt
CBAM_SYSTEM_PROMPT = """Sen CBAM Guard AI asistanısın. Türkiye'deki şirketlere AB Karbon Sınır Düzenleme Mekanizması (CBAM) konusunda yardımcı oluyorsun.

Uzmanlık alanların:
1. **Emisyon Analizi**: Scope 1, 2, 3 emisyonları, karbon ayak izi hesaplama
2. **CBAM Maliyet Tahmini**: Karbon fiyatları, sertifika maliyetleri, senaryo analizleri
3. **Yeşil Finansman**: Yeşil kredi seçenekleri, ROI hesaplaması, yatırım önerileri
4. **Mevzuat**: AB CBAM düzenlemeleri, geçiş dönemi, raporlama gereksinimleri

Yanıtlarında:
- Net ve anlaşılır ol
- Somut rakamlar ve örnekler ver
- Türkçe yanıt ver
- Gerektiğinde emoji kullan
- CBAM takvimini hatırlat (2024: raporlama, 2026: kademeli uygulama, 2034: tam uygulama)

Garanti BBVA yeşil finansman ürünlerini öner:
- Yeşil Enerji Kredisi: %1.49 faiz, 84 ay vade
- Enerji Verimliliği Kredisi: %1.79 faiz, 60 ay vade
- Temiz Teknoloji Kredisi: %1.99 faiz, 72 ay vade
"""


async def generate_ai_response(
    prompt: str, provider: Optional[LLMProvider] = None, use_cbam_context: bool = True
) -> str:
    """Generate an AI response using the specified or default provider"""

    if provider:
        llm = LLMProviderFactory.get_provider(provider)
    else:
        llm = LLMProviderFactory.get_default_provider()

    system_prompt = CBAM_SYSTEM_PROMPT if use_cbam_context else None

    return await llm.generate(prompt, system_prompt=system_prompt)
