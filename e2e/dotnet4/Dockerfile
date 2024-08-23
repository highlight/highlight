ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e-base:latest"
FROM ${IMAGE_BASE_NAME} AS dotnet-4

RUN sudo apt install ca-certificates gnupg
RUN sudo gpg --homedir /tmp --no-default-keyring --keyring /usr/share/keyrings/mono-official-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
RUN echo "deb [signed-by=/usr/share/keyrings/mono-official-archive-keyring.gpg] https://download.mono-project.com/repo/ubuntu stable-focal main" | sudo tee /etc/apt/sources.list.d/mono-official-stable.list
RUN sudo apt update && sudo apt install mono-complete mono-xsp4

WORKDIR /highlight/e2e/dotnet4
COPY ./dotnet4 .
WORKDIR /highlight/e2e/dotnet4/cs
RUN nuget.exe restore
RUN xbuild

ENV FRONTEND_URI="http://localhost:5249/Home"
ENV BACKEND_URI="http://localhost:5249/"
EXPOSE 5249
CMD ["xsp4", "-v", "--address=0.0.0.0", "--port=5249", "--nonstop", "--printlog", "--loglevels=All"]
