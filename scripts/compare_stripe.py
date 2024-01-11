"""A utility for scraping charges from stripe invoices by product."""

import datetime
import os

import stripe


def main():
    stripe.api_key = os.environ["STRIPE_API_KEY"]
    invoices = stripe.Invoice.list(expand=["data.subscription", "data.charge"])

    with open("invoices.csv", "w") as f:
        f.write(
            "customer_name,customer_id,customer_created_at,sessions,errors,logs,traces,sessions_cost,errors_cost,logs_cost,traces_cost\n"
        )
        for i, invoice in enumerate(invoices.auto_paging_iter()):
            amounts = {"Traces": 0, "Logs": 0, "Sessions": 0, "Errors": 0}
            costs = {"Traces": 0, "Logs": 0, "Sessions": 0, "Errors": 0}
            for li in invoice["lines"]["data"]:
                for key in amounts:
                    if key in li["description"]:
                        amounts[key] += li["quantity"]
                        costs[key] += li["amount"] / 100.0
                        break

            created = datetime.datetime.fromtimestamp(invoice["created"])
            f.write(
                f"{(invoice['customer_name'] or '').replace(',', ' ')},{invoice['customer']},{created.isoformat()},{amounts['Sessions']},{amounts['Errors']},{amounts['Logs']},{amounts['Traces']},{costs['Sessions']},{costs['Errors']},{costs['Logs']},{costs['Traces']}\n"
            )


if __name__ == "__main__":
    main()
