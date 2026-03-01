import re
import math
from typing import Dict, List, Tuple
from collections import Counter
import textstat
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class ATSScorer:
    def __init__(self):
        self._sbert_model = None
        self._nlp = None
        self._action_verbs = {
            "achieved", "developed", "implemented", "managed", "led", "created",
            "designed", "improved", "increased", "reduced", "launched", "built",
            "established", "optimized", "streamlined", "coordinated", "executed",
            "delivered", "exceeded", "transformed", "spearheaded", "pioneered",
            "orchestrated", "drove", "accelerated", "scaled", "negotiated",
            "analyzed", "researched", "evaluated", "identified", "resolved",
        }

    def _get_nlp(self):
        if self._nlp is None:
            try:
                import spacy
                self._nlp = spacy.load("en_core_web_md")
            except OSError:
                self._nlp = None
        return self._nlp

    def _get_sbert(self):
        if self._sbert_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception:
                self._sbert_model = None
        return self._sbert_model

    def score(self, resume_text: str, job_description: str = "") -> Dict:
        if not resume_text or not resume_text.strip():
            return self._empty_score()

        scores = {}
        weights = {
            "keyword_match": 0.25,
            "semantic_similarity": 0.20,
            "section_completeness": 0.15,
            "formatting": 0.10,
            "grammar": 0.10,
            "action_verbs": 0.08,
            "quantifiable_metrics": 0.07,
            "readability": 0.05,
        }

        scores["keyword_match"] = self._tfidf_score(resume_text, job_description)
        scores["semantic_similarity"] = self._sbert_score(resume_text, job_description)
        scores["section_completeness"] = self._section_completeness(resume_text)
        scores["formatting"] = self._formatting_score(resume_text)
        scores["grammar"] = self._grammar_score(resume_text)
        scores["action_verbs"] = self._action_verb_score(resume_text)
        scores["quantifiable_metrics"] = self._quantifiable_metrics_score(resume_text)
        scores["readability"] = self._readability_score(resume_text)

        total = sum(scores[k] * weights[k] for k in scores) * (100 / sum(weights.values()))
        total = min(100, max(0, total))

        return {
            "total_score": round(total, 2),
            "keyword_match": round(scores["keyword_match"], 2),
            "semantic_similarity": round(scores["semantic_similarity"], 2),
            "section_completeness": round(scores["section_completeness"], 2),
            "formatting": round(scores["formatting"], 2),
            "grammar": round(scores["grammar"], 2),
            "action_verbs": round(scores["action_verbs"], 2),
            "quantifiable_metrics": round(scores["quantifiable_metrics"], 2),
            "readability": round(scores["readability"], 2),
        }

    def _empty_score(self) -> Dict:
        return {
            "total_score": 0,
            "keyword_match": 0, "semantic_similarity": 0, "section_completeness": 0,
            "formatting": 0, "grammar": 0, "action_verbs": 0,
            "quantifiable_metrics": 0, "readability": 0,
        }

    def _tfidf_score(self, resume: str, job: str) -> float:
        if not job.strip():
            return 75.0
        try:
            vectorizer = TfidfVectorizer(stop_words="english", max_features=500)
            tfidf = vectorizer.fit_transform([resume.lower(), job.lower()])
            sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            return min(100, sim * 100)
        except Exception:
            return 50.0

    def _sbert_score(self, resume: str, job: str) -> float:
        model = self._get_sbert()
        if not model:
            return 60.0
        if not job.strip():
            return 75.0
        try:
            import numpy as np
            emb_resume = model.encode(resume[:4000])
            emb_job = model.encode(job[:4000])
            sim = np.dot(emb_resume, emb_job) / (np.linalg.norm(emb_resume) * np.linalg.norm(emb_job) + 1e-9)
            return min(100, max(0, (sim + 1) * 50))
        except Exception:
            return 50.0

    def _section_completeness(self, text: str) -> float:
        sections = ["experience", "education", "skills", "summary", "contact"]
        text_lower = text.lower()
        found = sum(1 for s in sections if s in text_lower or f"{s}:" in text_lower)
        return (found / len(sections)) * 100

    def _formatting_score(self, text: str) -> float:
        score = 70
        lines = text.strip().split("\n")
        if len(lines) >= 5:
            score += 10
        if any(re.match(r"^[A-Z][a-z]+.*\d{4}", line) for line in lines):
            score += 10
        if len(text) > 200:
            score += 10
        return min(100, score)

    def _grammar_score(self, text: str) -> float:
        try:
            flesch = textstat.flesch_reading_ease(text[:2000])
            return min(100, max(0, (flesch / 100) * 100 + 20))
        except Exception:
            return 70.0

    def _action_verb_score(self, text: str) -> float:
        words = re.findall(r"\b\w+\b", text.lower())
        if not words:
            return 0
        verb_count = sum(1 for w in words if w in self._action_verbs)
        return min(100, (verb_count / max(1, len(words) // 50)) * 25)

    def _quantifiable_metrics_score(self, text: str) -> float:
        patterns = [
            r"\d+%", r"\d+x", r"\$\d+", r"\d+\+", r"\d+\.\d+",
            r"increased by \d+", r"reduced by \d+", r"\d+ users",
            r"\d+ team", r"\d+ projects",
        ]
        matches = sum(1 for p in patterns if re.search(p, text, re.I))
        return min(100, 40 + matches * 15)

    def _readability_score(self, text: str) -> float:
        try:
            grade = textstat.flesch_kincaid_grade(text[:2000])
            return max(0, min(100, 100 - grade * 5))
        except Exception:
            return 70.0

    def analyze_job(self, job_description: str) -> Dict:
        nlp = self._get_nlp()
        if not nlp:
            return {"keywords": [], "skills": [], "summary": "NLP not loaded"}

        doc = nlp(job_description[:5000])
        keywords = [token.text for token in doc if token.pos_ in ("NOUN", "PROPN") and len(token.text) > 2][:30]
        skills = list(set(kw for kw in keywords if kw.lower() not in ("job", "company", "team", "role")))
        return {"keywords": skills[:15], "skills": skills[:15], "summary": job_description[:200] + "..."}

    def detect_skill_gap(self, resume_text: str, job_description: str) -> Dict:
        job_analysis = self.analyze_job(job_description)
        job_skills = set(s.lower() for s in job_analysis.get("skills", []))
        resume_lower = resume_text.lower()
        matched = [s for s in job_skills if s in resume_lower]
        missing = [s for s in job_skills if s not in resume_lower]
        return {"matched": matched, "missing": missing[:20], "match_rate": len(matched) / max(1, len(job_skills)) * 100}

    def get_suggestions(self, resume_text: str, job_description: str = "") -> Dict:
        suggestions = []
        score_data = self.score(resume_text, job_description)

        if score_data["action_verbs"] < 60:
            suggestions.append("Add more action verbs (e.g., achieved, developed, implemented)")
        if score_data["quantifiable_metrics"] < 50:
            suggestions.append("Include quantifiable achievements (percentages, numbers, metrics)")
        if score_data["section_completeness"] < 80:
            suggestions.append("Ensure all key sections are present: Experience, Education, Skills, Summary")
        if score_data["readability"] < 60:
            suggestions.append("Simplify sentence structure for better readability")
        if job_description and score_data["keyword_match"] < 60:
            suggestions.append("Add more keywords from the job description to your resume")

        return {"suggestions": suggestions, "scores": score_data}
