// Package saferequest provides SSRF-safe outbound HTTP dialing.
//
// DialContext is a net.Dialer.DialContext-compatible function that resolves
// the target host and refuses to connect to any private, loopback,
// link-local, multicast, unspecified, or IETF-reserved address — including
// cloud metadata endpoints (169.254.169.254) and DNS-rebinding attempts,
// since the resolved IP is checked at dial time on every connection (each
// redirect re-dials). Wire it into an http.Transport.DialContext to make an
// outbound HTTP client safe to point at attacker-influenced URLs.
package saferequest

import (
	"context"
	"errors"
	"fmt"
	"net"
	"time"
)

// ErrBlockedAddress is returned when a host resolves only to disallowed
// (non-public) networks.
var ErrBlockedAddress = errors.New("address resolves to a disallowed network")

// from https://en.wikipedia.org/wiki/Reserved_IP_addresses
var reservedCIDRs = []string{
	"0.0.0.0/8",
	"10.0.0.0/8",
	"100.64.0.0/10",
	"127.0.0.0/8",
	"169.254.0.0/16",
	"172.16.0.0/12",
	"192.0.0.0/24",
	"192.0.2.0/24",
	"192.88.99.0/24",
	"192.168.0.0/16",
	"198.18.0.0/15",
	"198.51.100.0/24",
	"203.0.113.0/24",
	"224.0.0.0/4",
	"240.0.0.0/4",
	"255.255.255.255/32",
	"::/128",
	"::1/128",
	// "::ffff:0:0/96" is omitted: it covers every IPv4 address. IPv4-mapped
	// IPv6 addresses are still matched against the IPv4 blocks above.
	"100::/64",
	"64:ff9b::/96",
	"2001::/32",
	"2001:10::/28",
	"2001:20::/28",
	"2001:db8::/32",
	"2002::/16",
	"fc00::/7",
	"fe80::/10",
	"ff00::/8",
}

var reservedBlocks = func() []*net.IPNet {
	blocks := make([]*net.IPNet, 0, len(reservedCIDRs))
	for _, cidr := range reservedCIDRs {
		_, ipNet, err := net.ParseCIDR(cidr)
		if err != nil {
			panic("error parsing CIDR " + cidr + ": " + err.Error())
		}
		blocks = append(blocks, ipNet)
	}
	return blocks
}()

// DialContext resolves host and dials only the IPs that pass IsPublicIP. If a
// host resolves to a mix of public and private IPs, only the public ones are
// attempted; if it resolves exclusively to disallowed addresses, the dial is
// rejected with ErrBlockedAddress before any connection is made.
func DialContext(ctx context.Context, network, addr string) (net.Conn, error) {
	host, port, err := net.SplitHostPort(addr)
	if err != nil {
		return nil, err
	}

	ips, err := net.DefaultResolver.LookupIPAddr(ctx, host)
	if err != nil {
		return nil, err
	}

	dialer := net.Dialer{Timeout: 10 * time.Second}
	var lastDialErr error
	publicAttempted := false
	for _, ip := range ips {
		if !IsPublicIP(ip.IP) {
			continue
		}
		publicAttempted = true
		conn, err := dialer.DialContext(ctx, network, net.JoinHostPort(ip.IP.String(), port))
		if err == nil {
			return conn, nil
		}
		lastDialErr = err
	}
	if publicAttempted {
		return nil, lastDialErr
	}
	return nil, fmt.Errorf("%w: %s", ErrBlockedAddress, host)
}

// IsPublicIP reports whether ip is a globally-routable unicast address that is
// safe to make an outbound request to. It rejects loopback, RFC1918 private,
// link-local, multicast, unspecified, and IETF-reserved / documentation /
// CGNAT ranges.
func IsPublicIP(ip net.IP) bool {
	if ip == nil {
		return false
	}
	for _, block := range reservedBlocks {
		if block.Contains(ip) {
			return false
		}
	}
	return true
}
