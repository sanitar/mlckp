# encoding: utf-8

class ContentsController < ApplicationController
  layout "content"
  def main
    @prices = [
      [14.99, "$14,99 в месяц (1 пользователь)"],
      [19.99, "$19,99 в месяц (2 пользователя)"],
      [29.99, "$29,99 в месяц (5 пользователей)"],
      [49.99, "$49,99 в месяц (10 пользователей)"],
      [69.99,"$69,99 в месяц (безлимитный)"] ]

    @instrument = %w[balzamiq axure lumzy mockingbird hot_gloo pidoco]

    @comments = []
    5.times do |i|
      comment = {user: "User#{i}",
             body: Faker::Lorem.paragraph(3),
             created_at: Time.now - rand(150).hours,
             rating: 5 - rand(10)
             }
      @comments << comment       
    end

  end

end