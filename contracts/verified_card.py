# { "Depends": "py-genlayer:latest" }

import json
from genlayer import *

class VerifiedCard(gl.Contract):
    def __init__(self):
        """Initialize the contract. No state needed for stateless verification."""
        pass

    @gl.public.write
    def verify_card(self, name: str, role: str) -> dict:
        """
        LLM verifies if the card is original and appropriate.
        Returns: {verified: bool, reason: str, verdict: str, nickname: str}
        """
        prompt = f"""
You are a GenLayer verification oracle. Analyze this GenFren card submission and respond ONLY with JSON.

Card Details:
- Name: {name}
- Role: {role}

Check these criteria:
1. Is the name non-empty and appropriate? 
   - ACCEPT: Any real name (full names, first names only, nicknames, initials like "JK" or "DJ", single names like "Alex" or "Sam")
   - REJECT ONLY: Obvious spam (like "asdfsadf"), hate speech, profanity, or offensive content
2. Is the role one of: neuron, synapse intern, synapse, brain intern, brain, singularity?
3. Is the overall submission original and community-friendly?

BE LENIENT with names - short names and initials are perfectly fine!

If verified, generate a creative nickname using GenLayer ecosystem terminology:
- Use GenLayer-themed words: Neural, Synapse, Brain, Validator, Consensus, Intelligent, Layer, Node, Chain, Oracle, Prompt, Token, Protocol, Network
- Combine with name or role using alliteration or wordplay
- Examples: "Consensus King", "Neural Navigator", "Validator Virtuoso", "Synapse Sage", "Chain Champion", "Oracle Overlord"
- Keep it 2-3 words maximum and make it sound cool!

Respond with ONLY this JSON format (no markdown, no extra text):
{{
  "verified": true or false,
  "verdict": "VERIFIED" or "SIMILAR" or "REJECTED",
  "reason": "brief explanation (max 10 words)",
  "nickname": "fun 2-3 word nickname" (only if verified, otherwise empty string)
}}

Examples:
{{"verified": true, "verdict": "VERIFIED", "reason": "Original and appropriate.", "nickname": "Neural Navigator"}}
{{"verified": false, "verdict": "REJECTED", "reason": "Contains inappropriate language.", "nickname": ""}}
"""
        try:
            # Call GenLayer LLM with JSON enforcement
            result = gl.nondet.exec_prompt(prompt, response_format="json")

            # Ensure result is dict
            if isinstance(result, str):
                result = json.loads(result)

            return {
                "verified": result.get("verified", False),
                "verdict": result.get("verdict", "REJECTED"),
                "reason": result.get("reason", "Verification failed."),
                "nickname": result.get("nickname", ""),
            }
        except Exception as e:
            # Fallback on error
            return {
                "verified": False,
                "verdict": "REJECTED",
                "reason": f"Verification error: {str(e)[:60]}",
                "nickname": "",
            }

    @gl.public.view
    def health_check(self) -> str:
        """Simple health check for contract."""
        return "VerifiedCard contract is live"
