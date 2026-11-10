import {
  Button,
  StatusBadge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@kairos-io/design";

// A node card, the kind of thing AuroraBoot's fleet pages show. Only the
// package's own classes and tokens are used; this app has no Tailwind.
export function App() {
  return (
    <main style={{ maxWidth: 480, margin: "48px auto", padding: "0 16px" }}>
      <Card>
        <CardHeader>
          <CardTitle>edge-node-03</CardTitle>
          <CardDescription>
            quay.io/kairos/ubuntu:24.04-standard-amd64-generic-v3.5.0-k3sv1.33.1-k3s1
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBadge status="Online" />
        </CardContent>
        <CardFooter style={{ gap: 8 }}>
          <Button>Upgrade</Button>
          <Button variant="outline">Open console</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
