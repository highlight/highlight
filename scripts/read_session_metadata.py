import csv
import os

import clickhouse_connect

client = clickhouse_connect.get_client(
    host=os.environ["CLICKHOUSE_ADDRESS"],
    username=os.environ["CLICKHOUSE_USERNAME"],
    password=os.environ["CLICKHOUSE_PASSWORD"],
    database=os.environ["CLICKHOUSE_DATABASE"],
    secure=True,
)


def read():
    with open(os.environ["INPUT_CSV"]) as f:
        for idx, row in enumerate(csv.reader(f)):
            if idx == 0:
                yield row
            else:
                r = client.query(
                    """
                                    select SessionAttributes['memberId'], SessionAttributes['subscriberId'], SessionAttributes['memberKey']
                                    from sessions_joined_vw
                                    where ProjectId = 24674
                                    and SessionAttributes['email'] = {email:String}
                                    and SessionAttributes['subscriberId'] != ''
                                    limit 1
                                    """,
                    {"email": row[3]},
                )
                if r.result_set:
                    row[4], row[5], row[6] = r.result_set[0]
                yield row


def main():
    with open(os.environ["OUTPUT_CSV"], "w", newline="") as f:
        writer = csv.writer(f)
        for row in read():
            print(row)
            writer.writerow(row)


if __name__ == "__main__":
    main()
