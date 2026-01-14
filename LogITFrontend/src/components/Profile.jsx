import Button from "./ui/Button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "./ui/Card";

function Profile() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <h2 className="text-xl text-bl font-bold">John Doe</h2>
        <p className="text-gray-500 text-sm">Software Engineer</p>
      </CardHeader>

      <CardContent>
        <p>
          John has been building React apps since 2015. He loves UI/UX and clean
          code.
        </p>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Message
        </Button>
        <Button variant="primary" size="sm">
          Follow
        </Button>
      </CardFooter>
    </Card>
  );
}
export default Profile;