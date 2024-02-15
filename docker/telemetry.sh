#!/bin/bash

telemetryFile=".telemetry"

echo 'Welcome to highlight.io!'
echo 'Thanks for helping improve the highlight open-source community.'
echo 'To know how folks are self-hosting highlight so that we can improve the product, we collect metrics about your usage.'
echo 'Learn more at https://www.highlight.io/docs/general/company/open-source/hosting/telemetry'

read -p 'Press enter to start highlight.io.'
touch $telemetryFile
