from app.models import Customer, Device, Geo, Transaction


def mock_transaction() -> Transaction:
    return Transaction(
        id="txn_veil_0314_47500",
        amount=47500,
        currency="USD",
        merchant="Private wire transfer",
        recipient="Offshore Holdings Ltd",
        timestamp="2026-05-19T03:14:00Z",
        channel="mobile_private_wire",
        customer=Customer(
            name="Amara Okafor",
            segment="Private Banking",
            homeCountry="United Kingdom",
            normalTransactionWindow="Usually active between 08:00 and 20:00 GMT with known devices",
        ),
        device=Device(
            id="dev_unknown_78A2",
            fingerprint="first-seen mobile browser, entropy mismatch",
            trustLevel="unknown",
            firstSeen="2026-05-19T03:07:00Z",
        ),
        geo=Geo(
            originCountry="United Kingdom",
            ipCountry="Nigeria",
            jurisdictionRisk="elevated offshore recipient and geolocation mismatch",
        ),
    )
