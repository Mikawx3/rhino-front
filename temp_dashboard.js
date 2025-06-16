"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Trash2, Calendar, Clock, AlertCircle, Loader2, MessageSquare, Trophy, Flame, UserPlus, UserMinus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRhinoAPI } from "@/lib/api-service";

export default function DashboardPage() {
  const { 
    user, 
    loading: authLoading, 
    subscriptions, 
    subscriptionsLoading,
    subscribeToSubject,
    unsubscribeFromSubject,
    filterSubjectsBySubscriptions 
  } = useAuth();
  const apiService = useRhinoAPI(user?.id);
  const [matieres, setMatieres] = useState([]);
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [newMatiere, setNewMatiere] = useState({
    name: "",
    description: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localSubscriptions, setLocalSubscriptions] = useState([]); // État local pour les abonnements
  const [error, setError] = useState(null);

  // Charger les données au montage
  useEffect(() => {
    if (user && apiService) {
      loadDashboardData();
      loadUserSubscriptionsFromAPI();
    }
  }, [user?.id]);


  const loadUserSubscriptionsFromAPI = async () => {
      const userSubscriptions = response.data?.subscriptions || [];
      console.log('✅ Abonnements chargés depuis l\'API:', userSubscriptions);
      
      setLocalSubscriptions(userSubscriptions);
    } catch (err) {
      console.error('Error loading subscriptions from API:', err);
      setLocalSubscriptions(subscriptions);
    }
  };
