import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Users, User, Mail, Phone, MapPin, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RESTAURANTS = [
  { id: "seraing", name: "Tasty Food Seraing", address: "15 Rue Gustave Bailly, 4101 Seraing" },
  { id: "angleur", name: "Tasty Food Angleur", address: "100 Rue Vaudrée, 4031 Angleur" },
  { id: "saint-gilles", name: "Tasty Food Saint-Gilles", address: "Rue Saint-Gilles 58, 4000 Liège" },
  { id: "wandre", name: "Tasty Food Wandre", address: "Rue du Pont de Wandre 75, 4020 Liège" },
];

const TIME_SLOTS = [
  "11:30", "12:00", "12:30", "13:00", "13:30", "14:00",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
];

const reservationSchema = z.object({
  restaurant_id: z.string().min(1, "Veuillez sélectionner un restaurant"),
  date: z.string().min(1, "Veuillez sélectionner une date"),
  time: z.string().min(1, "Veuillez sélectionner une heure"),
  party_size: z.coerce.number().min(1, "Minimum 1 personne").max(20, "Maximum 20 personnes"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  notes: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

const Reservation = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      restaurant_id: "",
      date: "",
      time: "",
      party_size: 2,
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ReservationFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual backend endpoint when ready
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la réservation');
      }

      const result = await response.json();
      console.log('Reservation created:', result);
      
      setIsSubmitted(true);
      form.reset();
    } catch (err) {
      console.error('Reservation error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="pb-10 md:pb-20 min-h-screen">
      <div className="container px-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="section-title mb-3 md:mb-4">
            RÉSERVER <span className="text-gradient-gold">UNE TABLE</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Réservez votre table dans l'un de nos restaurants Tasty Food et profitez de nos délicieux burgers smashés sur place !
          </p>
        </div>

        {/* Success Message */}
        {isSubmitted && (
          <Alert className="mb-8 border-green-500/20 bg-green-500/5">
            <Check className="h-5 w-5 text-green-500" />
            <AlertTitle className="text-green-700 dark:text-green-400 text-lg">
              Réservation confirmée !
            </AlertTitle>
            <AlertDescription className="text-muted-foreground mt-2">
              Votre réservation a été enregistrée avec succès. Vous recevrez un email de confirmation à l'adresse indiquée.
              <br />
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="link"
                className="mt-3 p-0 h-auto text-green-600 hover:text-green-700"
              >
                Faire une nouvelle réservation
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Reservation Form */}
        {!isSubmitted && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl font-display text-gradient-gold">
                Formulaire de réservation
              </CardTitle>
              <CardDescription>
                Remplissez les informations ci-dessous pour réserver votre table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Restaurant Selection */}
                  <FormField
                    control={form.control}
                    name="restaurant_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin size={16} />
                          Restaurant
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un restaurant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RESTAURANTS.map((restaurant) => (
                              <SelectItem key={restaurant.id} value={restaurant.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{restaurant.name}</span>
                                  <span className="text-xs text-muted-foreground">{restaurant.address}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar size={16} />
                            Date
                          </FormLabel>
                          <FormControl>
                            <Input type="date" min={today} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock size={16} />
                            Heure
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez l'heure" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Party Size */}
                  <FormField
                    control={form.control}
                    name="party_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users size={16} />
                          Nombre de personnes
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={20} {...field} />
                        </FormControl>
                        <FormDescription>
                          Pour les groupes de plus de 10 personnes, veuillez nous contacter directement.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-display text-lg text-foreground">Vos coordonnées</h3>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User size={16} />
                            Nom complet
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Jean Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail size={16} />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone size={16} />
                            Téléphone
                          </FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+32 4 XXX XX XX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optionnel)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Demandes particulières, allergies, chaise haute pour bébé..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full btn-order text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Réservation en cours...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Confirmer la réservation
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <div className="mt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>
            En cas de retard ou d'annulation, merci de nous prévenir au moins 2 heures à l'avance.
          </p>
          <p>
            Pour toute question : <a href="/contact" className="text-primary hover:underline">contactez-nous</a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Reservation;
