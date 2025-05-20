
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProfile, saveProfile, Profile } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    contact: '',
    cref: '',
    age: ''
  });
  const { toast } = useToast();
  
  useEffect(() => {
    const savedProfile = getProfile();
    setProfile(savedProfile);
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    saveProfile(profile);
    
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso."
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Perfil do Personal</h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Suas Informações</CardTitle>
            <CardDescription>
              Esses dados aparecerão nos treinos baixados pelos alunos.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                placeholder="Ex: Ingrid Lemos"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Contato (Telefone/Email)</Label>
              <Input
                id="contact"
                name="contact"
                value={profile.contact}
                onChange={handleInputChange}
                placeholder="Ex: (11) 98765-4321 ou ingrid@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cref">CREF</Label>
              <Input
                id="cref"
                name="cref"
                value={profile.cref}
                onChange={handleInputChange}
                placeholder="Ex: 123456-G/SP"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={profile.age}
                onChange={handleInputChange}
                placeholder="Ex: 30"
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full">Salvar Perfil</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
