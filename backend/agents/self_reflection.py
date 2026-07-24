"""
Critic Agent (evolved from self_reflection)
Evaluates generated answers for hallucination, relevance, and quality.
Returns a structured CritiqueResult with pass/fail, feedback, and confidence.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage




@dataclass
class CritiqueResult:
    passed: bool
    feedback: str
    confidence: float   # 0.0–1.0


def critique(question: str, context: str, answer: str) -> CritiqueResult:
    """
    Evaluate whether the generated answer is grounded in the retrieved context
    and actually answers the user's question.
    
    Args:
        question: The original user question.
        context: The concatenated document chunks used for generation.
        answer: The generated answer to evaluate.
    
    Returns:
        CritiqueResult with pass/fail verdict, feedback, and confidence score.
    """
    # Sanitize to prevent Cloudflare/WAF TCP connection drops due to null bytes from PDFs
    safe_context = context.replace('\x00', '')
    
    grading_prompt = f"""You are a lenient but fair quality judge. Your job is to check if the AI answer is reasonable given the context.
    User Question: {question}
    Retrieved Context: {safe_context}
    AI Answer: {answer}

    Rules:
    - Reply "YES" if the answer is factually supported by the context.
    - Reply "YES" if the answer is generally correct, even if it adds minor common-sense elaboration.
    - Reply "YES" if the answer is slightly verbose but not wrong.
    - Reply "YES" if the answer uses different wording but conveys the same meaning.
    - Reply "NO" ONLY if the answer contains clear factual fabrications that contradict the context.
    
    Default to "YES" when in doubt. Reply with ONLY "YES" or "NO".
    """

    print("  [Critic Agent] Evaluating answer quality...")
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)
    response = llm.invoke([HumanMessage(content=grading_prompt)])
    grade = response.content.strip().upper()

    if "YES" in grade:
        print("  [Critic Agent] Verdict: PASS ✓")
        return CritiqueResult(
            passed=True,
            feedback="Answer is grounded and relevant",
            confidence=0.95,
        )
    else:
        print("  [Critic Agent] Verdict: FAIL ✗")
        return CritiqueResult(
            passed=False,
            feedback="Hallucination or irrelevance detected — answer not grounded in context",
            confidence=0.35,
        )


# Legacy interface — kept for backward compatibility
def check_hallucination_and_relevance(question: str, context: str, answer: str) -> bool:
    """Legacy interface wrapping critique(). Returns True if passed."""
    result = critique(question, context, answer)
    return result.passed


def get_improvement_feedback(question: str, context: str, answer: str) -> str:
    """Generate specific improvement feedback for re-generation."""
    feedback_llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)
    prompt = f"The following AI answer was judged as poor. Provide 1 sentence of constructive feedback for the AI to fix it: {answer}. Question: {question}"
    return feedback_llm.invoke([HumanMessage(content=prompt)]).content