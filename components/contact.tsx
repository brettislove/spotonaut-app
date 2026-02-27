import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function ContactSection() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-3xl px-8 lg:px-0">
        <h1 className="text-center text-4xl font-semibold lg:text-5xl">
          Ozvěte se nám
        </h1>
        <p className="mt-4 text-center">
          Máte otázky, potřebujete více informací nebo chcete probrat možnosti
          spolupráce? Náš tým je tu pro vás! Neváhejte nás kontaktovat a my se
          vám co nejdříve ozveme. Těšíme se na vaši zprávu!
        </p>

        <Card className="mx-auto mt-12 max-w-lg p-8 shadow-md sm:p-16">
          <div>
            <h2 className="text-xl font-semibold">Napište nám váš dotaz</h2>
            <p className="mt-4 text-sm">
              Ozvěte se našemu týmu. Rádi zjistíme více o vašem záměru a
              pomůžeme vám vybrat nejlepší postup.
            </p>
          </div>

          <form
            action=""
            className="**:[&>label]:block mt-12 space-y-6 *:space-y-3"
          >
            <div>
              <Label htmlFor="name">Jméno a příjmení</Label>
              <Input type="text" id="name" required />
            </div>

            <div>
              <Label htmlFor="email">Pracovní e-mail</Label>
              <Input type="email" id="email" required />
            </div>

            <div>
              <Label htmlFor="country">Země / region</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte zemi / region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Česká republika</SelectItem>
                  <SelectItem value="2">Slovensko</SelectItem>
                  <SelectItem value="3">Jiná země</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="website">Web společnosti</Label>
              <Input type="url" id="website" />
              <span className="text-muted-foreground inline-block text-sm">
                URL musí začínat „https://“
              </span>
            </div>

            <div>
              <Label htmlFor="job">Typ podnikání</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte typ podnikání" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Gastronomie</SelectItem>
                  <SelectItem value="2">Maloobchod</SelectItem>
                  <SelectItem value="3">Služby</SelectItem>
                  <SelectItem value="4">Jiné</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="msg">Zpráva</Label>
              <Textarea id="msg" rows={3} />
            </div>

            <Button>Odeslat</Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
