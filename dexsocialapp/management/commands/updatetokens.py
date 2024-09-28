import requests
import time
from django.core.management.base import BaseCommand
from ...models import TokenData,TokenInfo

class Command(BaseCommand):
    help = 'Fetches data from the Dex API for tokens 0 to 3000 and stores it in the database'

    def handle(self, *args, **kwargs):
        with open('unique_contract_addresses.txt', 'r') as file:
            token_addresses = [line.strip() for line in file.readlines()][0:3000]  # Adjusted slice for 0 to 3000

        api_url_template = "https://frontend-api.pump.fun/coins/{}"
        total_tokens = len(token_addresses)

        for index, address in enumerate(token_addresses, start=0):  # Starting index adjusted to 0
            try:
                print(f"[INFO] Processing token {index + 1} of {total_tokens}: {address}")

                url = api_url_template.format(address)
                response = requests.get(url)
                response.raise_for_status()  # Raise an exception for bad status codes
                data = response.json()

                symbol = data.get('symbol', 'N/A')
                name = data.get('name', 'N/A')
                address = data.get('mint', 'N/A')

                # Extract website, telegram, twitter, and image_uri
                website = data.get('website', '')
                if website:
                    website = website.replace("https://", "")

                twitter = data.get('twitter', '')
                if twitter:
                    twitter = twitter.replace("https://x.com/", "")

                telegram = data.get('telegram', '')
                if telegram:
                    telegram.replace("https://t.me/", "")

                image_url = data.get('image_uri', '')  # Extract image URI

                # Save the data to the database
                TokenInfo.objects.create(
                    symbol=symbol,
                    name=name,
                    address=address,
                    website=website,
                    telegram=telegram,
                    twitter=twitter,
                    image_url=image_url  # Save image URL
                )

                print(f"[SUCCESS] Data saved for token: {symbol} ({name})")

            except requests.exceptions.RequestException as e:
                print(f"[ERROR] Request failed for {address}: {str(e)}")
            except KeyError as e:
                print(f"[ERROR] Data parsing failed for {address}: {str(e)}")
            except Exception as e:
                print(f"[ERROR] Unexpected error for {address}: {str(e)}")

            # Add a small delay to avoid overwhelming the API
            time.sleep(0.5)

        print(f"[INFO] Finished processing {total_tokens} tokens.")