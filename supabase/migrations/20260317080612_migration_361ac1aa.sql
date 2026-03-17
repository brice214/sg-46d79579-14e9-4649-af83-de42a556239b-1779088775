CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);

CREATE POLICY "Anyone can view published documents" ON documents FOR SELECT USING (is_published = true AND is_approved = true);
CREATE POLICY "Authors can view own documents" ON documents FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authors can insert documents" ON documents FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own documents" ON documents FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can view own purchases" ON transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = author_id);

CREATE POLICY "Users can report documents" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can view own purchases table" ON purchases FOR SELECT USING (auth.uid() = user_id);