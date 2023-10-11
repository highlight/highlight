"""A utility for scraping charges from stripe invoices by product."""

import datetime
import os

import stripe


def main():
    stripe.api_key = os.environ["STRIPE_API_KEY"]
    invoices = stripe.Invoice.list(
        expand=["data.subscription", "data.charge"]
    )  # created={'gte': 1693526400}

    with open("invoices.csv", "w") as f:
        f.write(
            "customer_name,customer_id,customer_created_at,sessions,errors,logs,sessions_cost,errors_cost,logs_cost\n"
        )
        for i, invoice in enumerate(invoices.auto_paging_iter()):
            amounts = {"Logs": 0, "Sessions": 0, "Errors": 0}
            costs = {"Logs": 0, "Sessions": 0, "Errors": 0}
            for li in invoice["lines"]["data"]:
                if li["description"] in amounts:
                    amounts[li["description"]] = li["quantity"]
                    costs[li["description"]] = li["amount"] / 100.0

            created = datetime.datetime.fromtimestamp(invoice["created"])
            f.write(
                f"{(invoice['customer_name'] or '').replace(',', ' ')},{invoice['customer']},{created.isoformat()},{amounts['Sessions']},{amounts['Errors']},{amounts['Logs']},{costs['Sessions']},{costs['Errors']},{costs['Logs']}\n"
            )


if __name__ == "__main__":
    main()
