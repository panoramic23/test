from app.deals_agent import DealHunterAgent


def test_discount_percent():
    assert DealHunterAgent._discount_percent(50, 100) == 50
    assert DealHunterAgent._discount_percent(120, 100) == 0


def test_anomaly_score():
    assert DealHunterAgent._anomaly_score(50, 100) == 0.5
    assert DealHunterAgent._anomaly_score(100, 100) == 0
