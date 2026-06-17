from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
import os

def check_hallucination_and_relevance(question: str, context: str, answer: str) -> bool:
    """
    Acts as an internal supervisor. Evaluates if the generated answer is 
    actually grounded in the documents and answers the user's question.
    """
    # We use temperature=0 because we want strict, robotic grading, not creativity
    grader_llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)
    
    # Inside backend/agents/self_reflection.py
    grading_prompt = f"""You are a helpful judge. Evaluate if the AI answer is supported by the context.
    User Question: {question}
    Retrieved Context: {context}
    AI Answer: {answer}

    If the answer is factually supported by the context, reply "YES". 
    If the answer is a blatant fabrication, reply "NO".
    If the answer is generally correct but slightly wordy or misses a minor detail, reply "YES".
    """
    
    print("Evaluating answer quality...")
    response = grader_llm.invoke([HumanMessage(content=grading_prompt)])
    
    # Clean the response to ensure we just get the boolean logic
    grade = response.content.strip().upper()
    
    if "YES" in grade:
        print("Grade: PASS (Answer is highly relevant)")
        return True
    else:
        print("Grade: FAIL (Hallucination or irrelevant detected)")
        return False
    

def get_improvement_feedback(question, context, answer):
    feedback_llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)
    prompt = f"The following AI answer was judged as poor. Provide 1 sentence of constructive feedback for the AI to fix it: {answer}. Question: {question}"
    return feedback_llm.invoke([HumanMessage(content=prompt)]).content