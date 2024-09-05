import os
import shutil
import subprocess

import requests
from bs4 import BeautifulSoup


def get_domain_htmls(emails: str):
    for email in emails.splitlines():
        name, domain = email.split("@")
        try:
            r = requests.get(f"https://{domain}/")
            assert r.ok, r.status_code
            yield domain, r.content
        except (AssertionError, requests.RequestException) as e:
            print(f"failed to fetch domain {domain} - {e}")
            continue


def get_domain_logos(content: str):
    soup = BeautifulSoup(content, "html.parser")
    for elem in soup.find_all("img"):
        url = elem.attrs.get("src")
        if not url:
            continue
        if (
            "logo" in url
            or any("logo" in v for k, v in elem.attrs.items())
            or any(
                "logo" in v
                for k, r in elem.attrs.items()
                for v in r
                if isinstance(r, list)
            )
        ):
            yield url


def fetch_logos(root_path: str, emails: str):
    for domain, content in get_domain_htmls(emails):
        for logo in get_domain_logos(content):
            for link in (logo, f"https://{domain}{logo}"):
                try:
                    img = requests.get(link)
                    assert img.ok, img.status_code
                    break
                except (AssertionError, requests.RequestException) as e:
                    print(f"failed to fetch image {domain} {link} - {e}")
            else:
                print(f"all links failed to fetch image for {domain}")
                continue

            file_name = logo.split("/")[-1]
            if not file_name:
                continue
            if len(file_name) > 32:
                file_name = file_name[:32]

            path = os.path.realpath(os.path.join(root_path, domain))
            try:
                os.makedirs(path)
            except FileExistsError:
                pass

            img_path = os.path.join(path, file_name)
            with open(img_path, "wb") as f:
                f.write(img.content)
                print(f"wrote {img_path} for {domain}")
                yield img_path


def edit_logo(path: str):
    file_name = os.path.basename(path)
    out_name = f"{file_name}.png"
    # process-logo is a script from logo.scm - place this in your gimp scripts folder
    call = subprocess.check_call(
        [
            "gimp",
            "-i",
            "-b",
            f'(process-logo "{file_name}" "{out_name}")',
            "-b",
            "(gimp-quit 0)",
        ],
        cwd=os.path.dirname(path),
    )
    if call > 0:
        print(f"failed to edit {path}")
    os.remove(path)


def save_logos():
    with open("emails.csv") as f:
        img_path = os.path.realpath(os.path.join(__file__, os.pardir, "images"))
        for file in fetch_logos(img_path, f.read()):
            edit_logo(file)


def extract_images():
    img_path = os.path.realpath(os.path.join(__file__, os.pardir, "images"))
    # walk img path and extract all files that are in subfolder to the parent dir
    for root, d, files in os.walk(img_path):
        for file in files:
            if root != img_path:
                domain = os.path.basename(root)
                src = os.path.join(root, file)
                dst = os.path.join(img_path, f'{domain}.logo.png')
                shutil.copy(src, dst)
                print(f"moved {src} to {dst}")

def main():
    # utility for copying files up to top level dir
    # extract_images()
    save_logos()


if __name__ == "__main__":
    main()
