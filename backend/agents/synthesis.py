"""
Synthesis Agent
Generates the final answer from retrieved context using the LLM.
Handles the TRIGGER_WEB_SEARCH detection when documents lack coverage.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List, Optional

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage



_TRIGGER_PHRASES = (
    "trigger_web_search", 
    "i don't have", 
    "not provided", 
    "not mentioned",
    "unable to find",
    "cannot find",
    "provided context",
    "no information",
    "does not contain"
)


@dataclass
class SynthesisResult:
    answer: str
    needs_web_search: bool


def synthesize(
    question: str,
    context_text: str,
    chat_history: list,
    feedback: Optional[str] = None,
) -> SynthesisResult:
    """
    Generate an answer using the LLM grounded in retrieved context.
    
    Args:
        question: The original user question.
        context_text: Concatenated document chunks.
        chat_history: Recent conversation turns (LangChain message objects).
        feedback: Optional critical feedback from the Critic agent for re-generation.
    
    Returns:
        SynthesisResult with the answer and whether web search is needed.
    """
    # Sanitize context_text to remove null bytes and non-printable characters 
    # which can trigger Cloudflare/WAF to drop the connection (causing APIConnectionError)
    safe_context = context_text.replace('\x00', '')
    
    system_prompt = f"""You are a helpful, intelligent assistant. 
Answer the user's latest question using the retrieved document chunks provided below.
If the answer cannot be found in the context, DO NOT attempt to guess. Instead, reply EXACTLY with the phrase "TRIGGER_WEB_SEARCH".

CURRENT RETRIEVED CONTEXT:
{safe_context}"""

    messages = [SystemMessage(content=system_prompt)]
    messages.extend(chat_history[-10:])
    messages.append(HumanMessage(content=question))

    # If the Critic gave feedback, inject it before re-generating
    if feedback:
        messages.append(SystemMessage(content=f"CRITICAL FEEDBACK: {feedback}. Correct any factual mistakes and reply strictly utilizing the context chunks."))

    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.2)
    ai_response = llm.invoke(messages)
    answer = ai_response.content

    # Check if the LLM signaled that documents lack coverage
    lower_ans = answer.lower()
    needs_web = any(phrase in lower_ans for phrase in _TRIGGER_PHRASES)

    return SynthesisResult(
        answer=answer if not needs_web else "",
        needs_web_search=needs_web,
    )


def synthesize_from_web(question: str, web_results: str) -> str:
    """Generate an answer using web search results instead of local documents."""
    messages = [
        SystemMessage(content=f"""You are a helpful, intelligent assistant. 
The user's question could not be answered using their private documents. 
Please answer their question using ONLY the live web search results provided below.
Include a brief note indicating that this information was pulled from the live web.

LIVE WEB RESULTS:
{web_results}"""),
        HumanMessage(content=question),
    ]
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.2)
    return llm.invoke(messages).content
