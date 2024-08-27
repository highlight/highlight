ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e:latest"
FROM ${IMAGE_BASE_NAME}

RUN gpg --homedir /tmp --no-default-keyring --keyring /usr/share/keyrings/mono-official-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
RUN echo "deb [signed-by=/usr/share/keyrings/mono-official-archive-keyring.gpg] https://download.mono-project.com/repo/ubuntu stable-focal main" | tee /etc/apt/sources.list.d/mono-official-stable.list
RUN apt update && apt install -y mono-complete mono-xsp4 nuget

WORKDIR /highlight/e2e/dotnet4
COPY . .
RUN nuget restore
WORKDIR /highlight/e2e/dotnet4/cs
RUN xbuild

ENV FRONTEND_URI="http://localhost:5249/"
ENV BACKEND_URI="http://localhost:5249/"
CMD ["xsp4", "-v", "--address=0.0.0.0", "--port=5249", "--nonstop", "--printlog", "--loglevels=All"]
