ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e-base:latest"
FROM ${IMAGE_BASE_NAME} AS dotnet-4

RUN echo "http://dl-4.alpinelinux.org/alpine/edge/testing" | cat - /etc/apk/repositories  > repositories && mv -f repositories /etc/apk
RUN apk add --no-cache mono mono-dev git bash automake autoconf findutils make pkgconf libtool g++
RUN git clone https://github.com/mono/xsp.git /opt/xsp
RUN cd /opt/xsp && ./autogen.sh && ./configure --prefix=/usr && make && make install
RUN rm -rf /opt/xsp
RUN apk del mono-dev git bash automake autoconf findutils make pkgconf libtool g++

WORKDIR /highlight/e2e/dotnet4
COPY ./dotnet4 .
WORKDIR /highlight/e2e/dotnet4/cs

ENV FRONTEND_URI="http://localhost:5249/Home"
ENV BACKEND_URI="http://localhost:5249/"
CMD ["xsp4", "-v", "--address=0.0.0.0", "--port=5249", "--nonstop", "--printlog", "--loglevels=All"]
